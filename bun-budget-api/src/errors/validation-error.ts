class ValidationError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export default ValidationError;
