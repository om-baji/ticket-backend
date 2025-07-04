package main

import (
	"context"
	"log"
	"net"

	pb "github.com/om-baji/ticket-backend/proto"

	"google.golang.org/grpc"
)

type bookingServer struct {
	pb.UnimplementedBookingEngineServer
}

func (s *bookingServer) BookTicket(ctx context.Context, req *pb.BookingRequest) (*pb.BookingResponse, error) {
	log.Printf("REQUEST FROM CLIENT")
	log.Printf("Received booking request: TrainID=%s, UserID=%s, Passengers=%d",
		req.TrainId, req.UserId, len(req.Passengers))

	seats := []*pb.Seats{}
	for i, passenger := range req.Passengers {
		seat := &pb.Seats{
			SeatNo: "S1-" + string(rune(65+i)),
			Berth:  passenger.Berth,
			Status: "CONFIRMED",
			Info:   passenger,
		}
		seats = append(seats, seat)
	}

	response := &pb.BookingResponse{
		Pnr:     "PNR" + req.UserId[len(req.UserId)-4:],
		Seat:    seats,
		Success: true,
		Message: "Booking confirmed successfully",
	}

	return response, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterBookingEngineServer(grpcServer, &bookingServer{})

	log.Println("BookingEngine gRPC server running at :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
