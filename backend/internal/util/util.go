// Package util holds small standard-library-only helpers shared across the
// backend, such as UUID generation and random number helpers.
package util

import (
	"crypto/rand"
	"fmt"
	"math/big"
)

// NewUUID returns a random RFC 4122 version 4 UUID string generated with
// crypto/rand. On the (extremely unlikely) event of a read failure it still
// returns a syntactically valid UUID.
func NewUUID() string {
	var b [16]byte
	_, _ = rand.Read(b[:])

	// Set version (4) and variant (RFC 4122) bits.
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// RandInt returns a uniformly distributed non-negative integer in [0, max).
// It returns 0 when max <= 0 or on a read failure.
func RandInt(max int) int {
	if max <= 0 {
		return 0
	}
	n, err := rand.Int(rand.Reader, big.NewInt(int64(max)))
	if err != nil {
		return 0
	}
	return int(n.Int64())
}
