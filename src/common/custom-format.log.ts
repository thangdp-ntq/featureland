import * as winston from 'winston';

const formatMeta = (meta) => {
  const splat = meta[Symbol.for('splat')];
  if (splat && splat.length) {
    return splat.length === 1
      ? JSON.stringify(splat[0])
      : JSON.stringify(splat);
  }
  return '';
};

export const CustomFormat = winston.format.printf(
  ({ timestamp, level, message, label = '', ...meta }) =>
    `[${timestamp}] [${level}]\t ${label}-${message} ${formatMeta(meta)} \n`,
);
