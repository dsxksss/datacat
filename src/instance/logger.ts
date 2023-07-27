import { join,resolve } from 'path';
import { tz } from 'moment-timezone';
import { createLogger, transports, format } from "winston";

// 当插件载入时触发
export const logger = createLogger({
    level: 'info',
    format: format.combine(
        // 添加时间戳格式化器
        format.timestamp({ format: () => tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss') }),
        format.printf((info: any) => {
            return `[${info.timestamp}] ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: join(resolve(__dirname,'..','..'), 'datacat-error.log'), level: 'error' }),
        // debug级别的日志一般为seqielize层面的操作
        new transports.File({ filename: join(resolve(__dirname,'..','..'), 'datacat-debug.log'), level: 'debug' }),
        new transports.File({ filename: join(resolve(__dirname,'..','..'), 'datacat.log') }),
    ],
});
