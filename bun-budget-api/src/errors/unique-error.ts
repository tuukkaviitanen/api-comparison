class UniqueError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export default UniqueError;
