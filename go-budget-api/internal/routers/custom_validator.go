package routers

import "github.com/gookit/validate"

// implements the binding.StructValidator
type customValidator struct{}

func (c *customValidator) ValidateStruct(ptr any) error {
	v := validate.Struct(ptr)
	v.Validate() // do validating

	if v.Errors.Empty() {
		return nil
	}

	return v.Errors
}

func (c *customValidator) Engine() any {
	return nil
}
