# SDK Publishing Guide

This guide explains how to publish the sBTC Gateway SDKs to npm and PyPI.

## Prerequisites

### For Node.js SDK (npm)

1. **npm account**: Create account at [npmjs.com](https://www.npmjs.com)
2. **npm CLI**: `npm install -g npm@latest`
3. **Login**: `npm login` and enter your credentials
4. **Organization** (optional): Create `@sbtc-gateway` organization on npm

### For Python SDK (PyPI)

1. **PyPI account**: Create account at [pypi.org](https://pypi.org)
2. **Build tools**: `pip install build twine`
3. **API token**: Generate API token in PyPI account settings
4. **Configure twine**: Create `~/.pypirc` file:

```ini
[distutils]
index-servers = pypi

[pypi]
username = __token__
password = pypi-AgEIcHlwaS5vcmcCJDxxx-your-token-here-xxx
```

## Publishing Process

### Automated Publishing (Recommended)

Run the publish script from the project root:

```bash
./sdk/publish.sh
```

This script will:

1. ✅ Check all dependencies
2. 🧪 Run tests for both SDKs
3. 🔨 Build packages
4. 📦 Publish to npm and PyPI
5. ✅ Verify successful publication

### Manual Publishing

#### Node.js SDK

```bash
cd sdk/node

# Install dependencies
npm install

# Run tests
npm test

# Build TypeScript
npm run build

# Verify package contents
npm pack --dry-run

# Publish (use --tag for pre-releases)
npm publish --access public

# For beta releases
npm publish --tag beta --access public
```

#### Python SDK

```bash
cd sdk/python

# Install build dependencies
pip install build twine

# Build package
python -m build

# Check package
python -m twine check dist/*

# Upload to PyPI
python -m twine upload dist/*

# For test PyPI (optional)
python -m twine upload --repository testpypi dist/*
```

## Version Management

### Semantic Versioning

Both SDKs follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features, backwards compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, backwards compatible (1.0.0 → 1.0.1)

### Updating Versions

#### Node.js SDK

Update `package.json`:

```json
{
  "version": "1.0.1"
}
```

Or use npm:

```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

#### Python SDK

Update `pyproject.toml`:

```toml
[project]
version = "1.0.1"
```

### Pre-release Versions

For beta/alpha releases:

#### Node.js

```bash
npm version prerelease --preid=beta  # 1.0.0-beta.1
npm publish --tag beta
```

#### Python

```toml
version = "1.0.0b1"  # Beta
version = "1.0.0a1"  # Alpha
version = "1.0.0rc1" # Release candidate
```

## Package Configuration

### npm Package Settings

The Node.js SDK uses these npm configurations:

```json
{
  "name": "@sbtc-gateway/node",
  "access": "public",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"]
}
```

### PyPI Package Settings

The Python SDK uses these PyPI configurations:

```toml
[project]
name = "sbtc-gateway"
dynamic = ["version"]
readme = "README.md"
license = {text = "MIT"}

[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"
```

## CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/publish-sdks.yml`:

```yaml
name: Publish SDKs

on:
  release:
    types: [published]

jobs:
  publish-node:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: cd sdk/node && npm install

      - name: Run tests
        run: cd sdk/node && npm test

      - name: Build
        run: cd sdk/node && npm run build

      - name: Publish to npm
        run: cd sdk/node && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  publish-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.9"

      - name: Install dependencies
        run: pip install build twine

      - name: Build package
        run: cd sdk/python && python -m build

      - name: Publish to PyPI
        run: cd sdk/python && python -m twine upload dist/*
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.PYPI_API_TOKEN }}
```

### Required Secrets

Add these secrets to your GitHub repository:

1. **NPM_TOKEN**: Your npm access token
2. **PYPI_API_TOKEN**: Your PyPI API token

## Testing Before Publishing

### Test in Isolation

Create temporary test projects:

#### Node.js Test

```bash
mkdir test-node-sdk
cd test-node-sdk
npm init -y
npm install ../path/to/sdk/node
```

```javascript
// test.js
const SBTCGateway = require("@sbtc-gateway/node");
const client = new SBTCGateway("sk_test_dummy");
console.log("SDK loaded successfully");
```

#### Python Test

```bash
mkdir test-python-sdk
cd test-python-sdk
python -m venv venv
source venv/bin/activate
pip install ../path/to/sdk/python
```

```python
# test.py
import sbtc_gateway
client = sbtc_gateway.SBTCGateway('sk_test_dummy')
print('SDK loaded successfully')
```

### Test Registries

Use test registries before publishing to production:

#### npm (verdaccio)

```bash
npm install -g verdaccio
verdaccio
npm publish --registry http://localhost:4873
```

#### PyPI (TestPyPI)

```bash
python -m twine upload --repository testpypi dist/*
pip install -i https://test.pypi.org/simple/ sbtc-gateway
```

## Post-Publishing

### Verification

After publishing, verify the packages:

#### npm

```bash
npm view @sbtc-gateway/node
npm install @sbtc-gateway/node
```

#### PyPI

```bash
pip show sbtc-gateway
pip install sbtc-gateway
```

### Documentation Updates

1. Update main README with new installation instructions
2. Update API documentation with version numbers
3. Create release notes on GitHub
4. Update developer guides and examples

### Announcements

1. **GitHub Release**: Create release with changelog
2. **Documentation**: Update version references
3. **Community**: Announce on Discord/forums
4. **Email**: Notify existing users (if applicable)

## Troubleshooting

### Common Issues

#### npm

- **403 Forbidden**: Check if package name is available and you have permissions
- **ENEEDAUTH**: Run `npm login` to authenticate
- **EPUBLISHCONFLICT**: Version already exists, bump version number

#### PyPI

- **403 Forbidden**: Check API token and package name availability
- **400 Bad Request**: Validate package metadata and files
- **Duplicate version**: Version already exists, bump version number

### Recovery

If publishing fails:

1. **Fix the issue** (version, credentials, etc.)
2. **Clean build artifacts**: `rm -rf dist/` (Python) or `rm -rf node_modules/` (Node.js)
3. **Rebuild and retry** the publishing process
4. **Test thoroughly** before retrying

## Maintenance

### Regular Updates

1. **Dependencies**: Keep dependencies up to date
2. **Security**: Monitor for security vulnerabilities
3. **API Changes**: Update SDKs when API changes
4. **Bug Fixes**: Address issues promptly
5. **Documentation**: Keep examples and docs current

### Deprecation Process

When deprecating versions:

1. **Announce** deprecation timeline
2. **Update docs** with migration guide
3. **Add deprecation warnings** to old versions
4. **Support** for reasonable transition period
5. **Remove** deprecated versions
