export const handleEnterNavigation = (e) => {
  if (e.key !== "Enter" || e.target.tagName === "TEXTAREA") {
    return;
  }

  // If submit button is focused, allow normal submit
  if (
    e.target.tagName === "BUTTON" &&
    e.target.type === "submit"
  ) {
    return;
  }

  e.preventDefault();

  const formElements = Array.from(e.target.form.elements).filter(
    (el) => !el.disabled && el.type !== "hidden"
  );

  const index = formElements.indexOf(e.target);

  if (index !== -1 && formElements[index + 1]) {
    formElements[index + 1].focus();
  }
};