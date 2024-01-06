import webpack from 'webpack';
import { renderer } from './webpack.config.base';

const config: webpack.Configuration[] = [
  {
    mode: 'production',
    ...renderer,
  },
];

export default config;
