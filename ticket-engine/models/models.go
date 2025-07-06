package models

import pb "github.com/om-baji/ticket-backend/proto"

type Ticket struct {
	Pnr       string        `json:"pnr"`
	Date      string        `json:"date"`
	Passenger []Passenger   `json:"passenger"`
	Quota     string        `json:"quota"`
	Class     string        `json:"class"`
	Status    BookingStatus `json:"status"`
}

type Passenger struct {
	Name   string `json:"name"`
	Age    int    `json:"age"`
	SeatNo string `json:"seatNo"`
	Berth  string `json:"berth"`
}

type SeatConfig struct {
	Berth     string
	SeatCount int
}

type AllocatedSeat struct {
	Passenger *pb.Passenger
	SeatNo    string
	Berth     string
	Status    string
}

type BookingStatus int

const (
	CONFIRM BookingStatus = iota
	WAITLISTED
	AGAINST_CANCELLATION
	CANCELLED
)
