package token

type ExpiredTokenError struct {
}

type InvalidTokenError struct {
}

func (ExpiredTokenError) Error() string {
	return "Token has expired"
}

func (InvalidTokenError) Error() string {
	return "Token is invalid"
}
