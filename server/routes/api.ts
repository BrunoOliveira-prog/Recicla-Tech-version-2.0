import { RequestHandler, Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { signToken } from "../auth/jwt";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";

export const api = Router();


//Estrutura de um agendamento:
const BookingCreationSchema = z.object({
  scheduledAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Data inválida'),
  notes: z.string().max(500).optional().nullable(),
  wasteType: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  weight: z.number().positive(),
  recyclerAddress: z.string().min(1).max(255),
});


//Rota de criar um agendamento:
api.post('/bookings', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  if (user.role !== 'RECICLADOR') {
    return res.status(403).json({ error: 'Apenas Recicladores podem criar agendamentos.' });
  }

  const parsed = BookingCreationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos para agendamento.' });
  }

  const { scheduledAt, notes, wasteType, quantity, weight, recyclerAddress } = parsed.data;

  try {
    const ins = await pool.query(
      `INSERT INTO bookings(user_id, scheduled_at, notes, waste_type, quantity, weight, recycler_address, status)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user.uid, new Date(scheduledAt), notes ?? null, wasteType, quantity, weight, recyclerAddress, 'PENDING']
    );
    res.status(201).json(ins.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao agendar coleta.' });
  }
}) as RequestHandler);


//Rota de pegar todos os agendamentos:
api.get('/bookings', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  let query = '';
  let params: any[] = [user.uid];

  if (user.role === 'RECICLADOR') {
    //O reciclador só poder ver apenas os próprios agendamentos dele:
    query = `SELECT b.*, u.name as recycler_name, u.email as recycler_email,
             cp.name as collection_point_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             LEFT JOIN collection_points cp ON b.point_id = cp.id
             WHERE b.user_id = $1
             ORDER BY b.scheduled_at DESC`;
  } else if (user.role === 'COLETOR') {
    //O coletor vê agendamentos que ele confirmou(collector_id) ou que estão PENDING sem coletor_id:
    query = `SELECT b.*, u.name as recycler_name, u.email as recycler_email,
             cp.name as collection_point_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             LEFT JOIN collection_points cp ON b.point_id = cp.id
             WHERE b.collector_id = $1 OR (b.collector_id IS NULL AND b.status = 'PENDING')
             ORDER BY b.scheduled_at DESC`;
  } else {
    return res.status(403).json({ error: 'Permissão negada para ver agendamentos.' });
  }

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
}) as RequestHandler);


//Rota de pegar um agendamento específico:
api.get('/bookings/:id', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  const { id } = req.params as any;

  let query = `SELECT b.*, u.name as recycler_name, u.email as recycler_email,
             cp.name as collection_point_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             LEFT JOIN collection_points cp ON b.point_id = cp.id
             WHERE b.id = $1`;
  let params: any[] = [id];

  if (user.role === 'RECICLADOR') {
    //O reciclador só pode ver seus próprios agendamentos:
    query += ` AND b.user_id = $2`;
    params.push(user.uid);
  } else if (user.role === 'COLETOR') {
    //O coletor só pode ver agendamentos que ele está coletando ou que estão PENDING:
    query += ` AND (b.collector_id = $2 OR (b.collector_id IS NULL AND b.status = 'PENDING'))`;
    params.push(user.uid);
  } else {
    return res.status(403).json({ error: 'Permissão negada.' });
  }

  try {
    const { rows } = await pool.query(query, params);
    if (!rows[0]) return res.status(404).json({ error: 'Agendamento não encontrado ou sem permissão.' });
    res.json(rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao buscar agendamento.' });
  }
}) as RequestHandler);


//Rota de deletar um agendamento:
api.delete('/bookings/:id', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  const { id } = req.params as any;
  if (user.role !== 'RECICLADOR') {
    return res.status(403).json({ error: 'Apenas Recicladores podem excluir agendamentos.' });
  }

  try {
    //Vê se o agendamento existe e se é do usuário:
    const { rows: bookingRows } = await pool.query(
      'SELECT status FROM bookings WHERE id=$1 AND user_id=$2',
      [id, user.uid]
    );
    if (!bookingRows[0]) {
      return res.status(404).json({ error: 'Agendamento não encontrado ou sem permissão.' });
    }

    const bookingStatus = bookingRows[0].status;
    //Não deixa deletar se o agendamento for confirmado ou está concluído:
    if (bookingStatus === 'CONFIRMED' || bookingStatus === 'COMPLETED') {
      return res.status(403).json({ error: 'Não é possível excluir agendamentos confirmados ou concluídos.' });
    }

    const del = await pool.query('DELETE FROM bookings WHERE id=$1 AND user_id=$2 RETURNING * ', [id, user.uid]);
    if (!del.rowCount) return res.status(404).json({ error: 'Agendamento não encontrado ou sem permissão para excluir' });
    //res.status(204).end(); //Esse ta dando alguns bugs com o Toast.
    res.json({});
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao excluir agendamento.' });
  }
}) as RequestHandler);





//Estrutura de um agendamento:
const BookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'PAUSED']).optional(),
  pointId: z.number().int().positive().optional(),
  scheduledAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Data inválida').optional(),
  notes: z.string().max(500).optional().nullable(),
  wasteType: z.string().min(1).max(255).optional(),
  quantity: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  recyclerAddress: z.string().min(1).max(255).optional(),
  collected_weight: z.number().positive().optional(), // Permitir que o coletor informe o peso
});

//Rota de atualizar um agendamento:
api.put('/bookings/:id', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  const { id } = req.params as any;
  const parsed = BookingUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  //Pegar os dados:
  const { status, pointId, scheduledAt, notes, wasteType, quantity, weight, recyclerAddress, collected_weight } = parsed.data;

  // Validar collected_weight: só deve ser enviado pelo Coletor e quando o status for COMPLETED
  if (collected_weight !== undefined && (user.role !== 'COLETOR' || status !== 'COMPLETED')) {
    return res.status(400).json({ error: 'Peso coletado só pode ser informado por um Coletor ao completar o agendamento.' });
  }

  try {
    // Primeiro, busque o agendamento para verificar seu estado atual e permissões
    const { rows: currentBookingRows } = await pool.query(
      `SELECT user_id, collector_id, status FROM bookings WHERE id = $1`,
      [id]
    );

    if (currentBookingRows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const currentBooking = currentBookingRows[0];
    let query = 'UPDATE bookings SET ';
    const params: any[] = [];
    let paramIndex = 1;

    // Lógica para Reciclador
    if (user.role === 'RECICLADOR') {
      if (currentBooking.user_id !== user.uid) {
        return res.status(403).json({ error: 'Você não tem permissão para editar este agendamento.' });
      }
      if (status && (status === 'COMPLETED' || status === 'CANCELLED')) {
        return res.status(403).json({ error: 'Apenas Coletores podem alterar status para CONCLUÍDO ou CANCELADO.' });
      }
      // Permite ao reciclador pausar/reativar e editar detalhes
      if (status !== undefined) { query += `status=$${paramIndex++}, `; params.push(status); }
      if (scheduledAt !== undefined) { query += `scheduled_at=$${paramIndex++}, `; params.push(new Date(scheduledAt)); }
      if (notes !== undefined) { query += `notes=$${paramIndex++}, `; params.push(notes); }
      if (wasteType !== undefined) { query += `waste_type=$${paramIndex++}, `; params.push(wasteType); }
      if (quantity !== undefined) { query += `quantity=$${paramIndex++}, `; params.push(quantity); }
      if (weight !== undefined) { query += `weight=$${paramIndex++}, `; params.push(weight); }
      if (recyclerAddress !== undefined) { query += `recycler_address=$${paramIndex++}, `; params.push(recyclerAddress); }

      query = query.slice(0, -2); // Remove a última vírgula e espaço
      query += ` WHERE id=$${paramIndex++} RETURNING *`;
      params.push(id);

    } else if (user.role === 'COLETOR') {
      // Lógica para Coletor: Assumir, Concluir, ou outras atualizações
      if (status === 'CONFIRMED' && collected_weight === undefined) {
        // Coletor tentando "Assumir" um agendamento PENDENTE e sem coletor
        if (currentBooking.status !== 'PENDING' || currentBooking.collector_id !== null) {
          return res.status(400).json({ error: 'Este agendamento não pode ser assumido (já está confirmado ou não é pendente).' });
        }
        query += `status=$${paramIndex++}, collector_id=$${paramIndex++} WHERE id=$${paramIndex++} AND status=\'PENDING\' AND collector_id IS NULL RETURNING *`;
        params.push('CONFIRMED', user.uid, id);
      } else if (status === 'COMPLETED' && collected_weight !== undefined) {
        // Coletor tentando "Concluir" um agendamento que ele assumiu
        if (currentBooking.collector_id !== user.uid) {
          return res.status(403).json({ error: 'Você só pode concluir agendamentos que você assumiu.' });
        }
        if (currentBooking.status === 'COMPLETED') {
          return res.status(400).json({ error: 'Agendamento já está concluído.' });
        }
        query += `status=$${paramIndex++}, collected_weight=$${paramIndex++} WHERE id=$${paramIndex++} AND collector_id=$${paramIndex++} RETURNING *`;
        params.push('COMPLETED', collected_weight, id, user.uid);
      } else if (status !== undefined) {
        // Outras atualizações de status por um coletor (PAUSED, CANCELLED)
        if (currentBooking.collector_id !== user.uid) {
          return res.status(403).json({ error: 'Você não tem permissão para alterar este agendamento.' });
        }
        query += `status=$${paramIndex++} WHERE id=$${paramIndex++} AND collector_id=$${paramIndex++} RETURNING *`;
        params.push(status, id, user.uid);
      } else {
        return res.status(400).json({ error: 'Ação inválida para Coletor.' });
      }

    } else {
      return res.status(403).json({ error: 'Permissão negada.' });
    }

    if (params.length === 0 || query === 'UPDATE bookings SET ') {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
    }

    const upd = await pool.query(query, params);
    if (!upd.rowCount) return res.status(404).json({ error: 'Agendamento não encontrado ou sem permissão para atualizar.' });
    res.json(upd.rows[0]);
  } catch (e: any) {
    console.error('Erro ao atualizar agendamento:', e);
    res.status(500).json({ error: e.message || 'Erro interno ao atualizar agendamento.' });
  }
}) as RequestHandler);





//Rota de pegar as estatísticas:
api.get('/stats', (async (_req, res) => {
  try {
    const [{ rows: p }, { rows: b }, { rows: b30 }] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM collection_points WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*)::int AS c FROM bookings'),
      pool.query("SELECT COUNT(*)::int AS c, SUM(quantity)::int as q FROM bookings WHERE created_at >= NOW() - INTERVAL '30 days'"),
    ]);
    const { rows: completedBookings } = await pool.query(
      "SELECT SUM(collected_weight) AS total_weight FROM bookings WHERE status = 'COMPLETED' AND collected_weight IS NOT NULL"
    );
    const total_points = p[0]?.c || 0;
    const total_bookings = b[0]?.c || 0;
    const bookings_30d = b30[0]?.c || 0;
    const items_30d = b30[0]?.q || 0;
    const total_collected_kg = completedBookings[0]?.total_weight || 0;
    const estimated_kg = total_collected_kg;
    res.json({ total_points, bookings_30d, items_30d, estimated_kg });
  } catch (error) {
    res.json({ total_points: 0, bookings_30d: 0, estimated_kg: 0 });
  }
}) as RequestHandler);





//Estrutura de o registro de uma conta:
const RegisterSchema = z.object({
  email: z.string().email(),
  mode: z.string().min(1).max(25),
  name: z.string().min(2).max(120),
  password: z.string().min(6).max(120),
  role: z.string().min(1).max(25),
});

//Rota de criar uma conta:
api.post('/auth/register', (async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });
  const { name, email, password, role } = parsed.data;
  const r = role === 'COLETOR' ? 'COLETOR' : 'RECICLADOR';
  const hash = await bcrypt.hash(password, 10);
  try {
    const ins = await pool.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role', [name, email, hash, r]);
    const u = ins.rows[0];
    const token = signToken({ uid: u.id, role: u.role, email: u.email, name: u.name });
    res.json({ token, user: u });
  } catch (e: any) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro ao registrar' });
  }
}) as RequestHandler);



//Estrutura de o login de uma conta:
const LoginSchema = z.object({
  email: z.string().email(),
  mode: z.string().min(1).max(25),
  password: z.string().min(1)
});

//Rota de login:
api.post('/auth/login', (async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });
  const { email, password } = parsed.data;
  const { rows } = await pool.query('SELECT id,name,email,role,password_hash FROM users WHERE email=$1', [email]);
  const u = rows[0];
  if (!u || !u.password_hash) return res.status(401).json({ error: 'Credenciais inválidas' });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });
  const token = signToken({ uid: u.id, role: u.role, email: u.email, name: u.name });
  res.json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
}) as RequestHandler);


//Rota de pegar a conta:
api.get('/me', requireAuth, (async (req, res) => {
  const { uid } = req.userJwt!;
  const { rows } = await pool.query('SELECT id,name,email,role, (google_id IS NOT NULL) AS has_google FROM users WHERE id=$1', [uid]);
  res.json(rows[0]);
}) as RequestHandler);


//Rota de atualizar a conta:
api.put('/me', requireAuth, (async (req, res) => {
  const { uid } = req.userJwt!;
  const { rows: grows } = await pool.query('SELECT google_id FROM users WHERE id=$1', [uid]);
  const hasGoogle = Boolean(grows[0]?.google_id);
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (hasGoogle && (email || password)) return res.status(400).json({ error: 'Conta Google: só é permitido alterar o nome' });
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, uid]);
  }
  if (name) await pool.query('UPDATE users SET name=$1 WHERE id=$2', [name, uid]);
  if (email) await pool.query('UPDATE users SET email=$1 WHERE id=$2', [email, uid]);
  const { rows } = await pool.query('SELECT id,name,email,role, (google_id IS NOT NULL) AS has_google FROM users WHERE id=$1', [uid]);
  res.json(rows[0]);
}) as RequestHandler);


//Rota de deletar a conta:
api.delete('/me', requireAuth, (async (req, res) => {
  const { uid } = req.userJwt!;
  await pool.query('DELETE FROM users WHERE id=$1', [uid]);
  res.status(204).end();
}) as RequestHandler);





//Estrutura de ponto de coleta:
const PointSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional().nullable(),
  address: z.string().max(240).optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  types: z.string().max(240).optional().nullable(),
  hours: z.string().max(240).optional().nullable(),
  is_active: z.boolean().optional(), // Não permitimos editar is_active diretamente aqui, será via toggle
});


//Rota de criar um ponto de coleta:
api.post('/points', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  if (user.role !== 'COLETOR') return res.status(403).json({ error: 'Apenas Coletores' });
  const parsed = PointSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });
  const { name, description, address, lat, lng, types, hours, is_active } = parsed.data;
  // Adiciona is_active como TRUE por padrão ao criar
  const ins = await pool.query(
    'INSERT INTO collection_points(owner_id,name,description,address,lat,lng,types,hours, is_active) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9) RETURNING *',
    [user.uid, name, description ?? null, address ?? null, lat, lng, types ?? null, hours ?? null, is_active]
  );
  res.json(ins.rows[0]);
}) as RequestHandler);


//Rota de pegar todos os pontos de coleta:
api.get('/points', (async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,owner_id,name,description,address,lat,lng,types,hours,is_active FROM collection_points ORDER BY created_at DESC');
    res.json(rows);
  } catch {
    res.json([]);
  }
}) as RequestHandler);


//Rota de pegar um ponto de coleta específico:
api.get('/points/:id', requireAuth, (async (req, res) => {
  const { id } = req.params as any;
  const { rows } = await pool.query('SELECT *, is_active FROM collection_points WHERE id=$1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
  res.json(rows[0]);
}) as RequestHandler);


//Rota de atualizar um ponto de coleta:
api.put('/points/:id', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  const { id } = req.params as any;
  const parsed = PointSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });
  const { name, description, address, lat, lng, types, hours } = parsed.data;

  const ownerCheck = await pool.query('SELECT owner_id, is_active FROM collection_points WHERE id=$1', [id]);
  if (!ownerCheck.rows[0]) return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
  if (ownerCheck.rows[0].owner_id !== user.uid) return res.status(403).json({ error: 'Você não tem permissão para editar este ponto de coleta' });

  let query = 'UPDATE collection_points SET ';
  const params: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) { query += `name=$${paramIndex++}, `; params.push(name); }
  if (description !== undefined) { query += `description=$${paramIndex++}, `; params.push(description); }
  if (address !== undefined) { query += `address=$${paramIndex++}, `; params.push(address); }
  if (lat !== undefined) { query += `lat=$${paramIndex++}, `; params.push(lat); }
  if (lng !== undefined) { query += `lng=$${paramIndex++}, `; params.push(lng); }
  if (types !== undefined) { query += `types=$${paramIndex++}, `; params.push(types); }
  if (hours !== undefined) { query += `hours=$${paramIndex++}, `; params.push(hours); }

  if (params.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

  query = query.slice(0, -2);
  query += ` WHERE id=$${paramIndex++} AND owner_id=$${paramIndex++} RETURNING *`;
  params.push(id, user.uid);

  const upd = await pool.query(query, params);
  if (!upd.rowCount) return res.status(404).json({ error: 'Ponto de coleta não encontrado ou sem permissão' });
  res.json(upd.rows[0]);
}) as RequestHandler);


//Rota de deletar um ponto de coleta:
api.delete('/points/:id', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  const { id } = req.params as any;

  const ownerCheck = await pool.query('SELECT owner_id FROM collection_points WHERE id=$1', [id]);
  if (!ownerCheck.rows[0] || ownerCheck.rows[0].owner_id !== user.uid) {
    return res.status(403).json({ error: 'Você não tem permissão para excluir este ponto de coleta' });
  }

  const del = await pool.query('DELETE FROM collection_points WHERE id=$1 AND owner_id=$2 RETURNING *', [id, user.uid]);
  if (!del.rowCount) return res.status(404).json({ error: 'Ponto de coleta não encontrado ou sem permissão' });
  res.json({});
}) as RequestHandler);


//Rota de ativar e desativar ponto de coleta:
api.put('/points/:id/toggle-active', requireAuth, (async (req, res) => {
  const user = req.userJwt!;
  const { id } = req.params as any;

  //Ver se o usuário é o dono do ponto:
  const pointCheck = await pool.query('SELECT owner_id, is_active FROM collection_points WHERE id=$1', [id]);
  if (!pointCheck.rows[0]) {
    return res.status(404).json({ error: 'Ponto de coleta não encontrado' });
  }
  if (pointCheck.rows[0].owner_id !== user.uid) {
    return res.status(403).json({ error: 'Você não tem permissão para modificar este ponto de coleta' });
  }

  const currentStatus = pointCheck.rows[0].is_active;
  const newStatus = !currentStatus;
  const upd = await pool.query('UPDATE collection_points SET is_active=$1 WHERE id=$2 AND owner_id=$3 RETURNING *', [newStatus, id, user.uid]);
  if (!upd.rowCount) {
    return res.status(404).json({ error: 'Ponto de coleta não encontrado ou sem permissão' });
  }
  res.json(upd.rows[0]);
}) as RequestHandler);