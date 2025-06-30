import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, './user.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = loadPackageDefinition(packageDef) as any;

export const authClient = new authProto.auth.AuthService(
  'localhost:9090',
  credentials.createInsecure()
);
