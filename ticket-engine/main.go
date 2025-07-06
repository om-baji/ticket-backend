package main

import (
	"context"
	"log"
	"net"
	"sync"

	pb "github.com/om-baji/ticket-backend/proto"
	"github.com/om-baji/ticket-backend/ticket-engine/helper"

	"google.golang.org/grpc"
)

type bookingServer struct {
	pb.UnimplementedBookingEngineServer
}

func (s *bookingServer) BookTicket(ctx context.Context, req *pb.BookingRequest) (*pb.BookingResponse, error) {
	log.Println("Received booking request:", req.Pnr)

	resultChan := make(chan *pb.Seats, len(req.Passengers))
	var wg sync.WaitGroup

	for _, p := range req.Passengers {
		wg.Add(1)
		go helper.ConcurrentSeat(p, req.TrainId, req.TravelClass, &wg, resultChan)
	}

	wg.Wait()
	close(resultChan)

	var results []*pb.Seats
	for seat := range resultChan {
		results = append(results, seat)
		log.Println("Seat -> ", seat.SeatNo)
	}

	response := &pb.BookingResponse{
		Pnr:     "PNR_" + req.Pnr,
		Seat:    results,
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
