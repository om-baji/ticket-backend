import { loadPackageDefinition, credentials, Client, Metadata, type CallOptions, type ClientUnaryCall, type ServiceError } from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import type { BookingRequest, BookingResponse } from '../utils/types';

const PROTO_PATH = path.resolve(__dirname, './booking.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObj = loadPackageDefinition(packageDef) as unknown as {
  ticket_backend: {
    BookingEngine: typeof Client;
  };
};

export interface BookingEngineClient {
  BookTicket(
    request: BookingRequest,
    callback: (error: ServiceError | null, response: BookingResponse) => void
  ): ClientUnaryCall;

  BookTicket(
    request: BookingRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: BookingResponse) => void
  ): ClientUnaryCall;

  BookTicket(
    request: BookingRequest,
    metadata: Metadata,
    options: CallOptions,
    callback: (error: ServiceError | null, response: BookingResponse) => void
  ): ClientUnaryCall;
}

export const bookingClient = new grpcObj.ticket_backend.BookingEngine(
  'localhost:50051',
  credentials.createInsecure()
) as unknown as BookingEngineClient;

