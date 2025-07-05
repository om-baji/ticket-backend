package utils

var Fallback = map[string][]string{
	"LB":   {"MB", "UB", "SL", "SU", "NONE"},
	"MB":   {"LB", "UB", "SL", "SU", "NONE"},
	"UB":   {"MB", "LB", "SL", "SU", "NONE"},
	"SL":   {"LB", "MB", "UB", "SU", "NONE"},
	"SU":   {"LB", "MB", "UB", "SL", "NONE"},
	"NONE": {"LB", "MB", "UB", "SL", "SU"},
}
