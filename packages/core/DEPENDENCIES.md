# 依赖说明

## Future Dependencies

### ws
- **用途**: WebSocket server for ESLint communication
- **状态**: Future dependency - 将在未来用于实时 ESLint 通信
- **相关**: 计划替代当前的自定义 worker 通信机制

### @uni-helper/uni-env
- **用途**: uni-app environment type definitions
- **状态**: Optional peer dependency - 用于支持 uni-app 项目
- **相关**: 提供跨平台环境变量支持，仅在 uni-app 项目中需要
