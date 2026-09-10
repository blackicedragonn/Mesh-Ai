import morgan from 'morgan';

const isProduction = process.env.NODE_ENV === 'production';

export const requestLogger = morgan(isProduction ? 'combined' : 'dev');
