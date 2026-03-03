/**
 * Returns a string describing the error if the given object has properties not in the allowed list.
 * Returns empty string if there is no error.
 *
 * @param {Object} object - The object to check
 * @param {string[]} allowedFields - The properties that are allowed
 */
const validateAllowedFields = (object, allowedFields) => {
  const invalidFields = [];

  Object.keys(object).forEach((key) => {
    if (!allowedFields.includes(key)) {
      invalidFields.push(key);
    }
  });

  if (invalidFields.length > 0) {
    return `the following properties are not allowed to be set: ${invalidFields.join(", ")}`;
  }
  return "";
};

export default validateAllowedFields;
