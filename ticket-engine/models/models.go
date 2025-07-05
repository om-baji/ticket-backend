package models

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

type BookingStatus int

const (
	CONFIRM BookingStatus = iota
	WAITLISTED
	AGAINST_CANCELLATION
	CANCELLED
)
