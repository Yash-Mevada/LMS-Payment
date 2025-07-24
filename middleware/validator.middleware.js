import { body, query, param, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    // run all validation
    await Promise.all(validations.map(validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedError = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw new Error("Validation error");
  };
};

export const commonValidations = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive number"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 to 100"),
  ],
  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide valid email"),
  name: body("name")
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Please provide valid name"),
};

export const validationSignup = validate([
  commonValidations.email,
  commonValidations.name,
]);
