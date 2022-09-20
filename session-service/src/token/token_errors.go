package token

type ExpiredTokenError struct {
}

type InvalidTokenError struct {
}

func (ExpiredTokenError) Error() string {
	return "Token has expired"
}

func (err *ExpiredTokenError) Is(target error) bool {
	_, ok := target.(ExpiredTokenError)
	return ok
}

func (InvalidTokenError) Error() string {
	return "Token is invalid"
}

func (err *InvalidTokenError) Is(target error) bool {
	_, ok := target.(InvalidTokenError)
	return ok
}
