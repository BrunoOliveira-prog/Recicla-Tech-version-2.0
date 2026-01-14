import L from 'leaflet';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: shadow,
});

export default L;
