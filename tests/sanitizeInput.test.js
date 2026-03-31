const sanitize = require('../middleware/sanitizeInput');

describe('sanitizeInput middleware', () => {
  it('strips html tags from strings', () => {
    const req = { body: { text: '<script>alert(1)</script> hello' }, query: {} };
    const res = {};
    sanitize(req, res, () => {});
    expect(req.body.text.includes('<script>')).toBe(false);
  });
});
