export function mockWindowConfirm(returnValue = true) {
  return jest.spyOn(window, 'confirm').mockReturnValue(returnValue);
}
