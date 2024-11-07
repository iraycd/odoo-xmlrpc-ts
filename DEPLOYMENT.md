# Deployment Guide(For Contributors/Maintainers)

This document outlines the process for deploying new versions of `odoo-xmlrpc-ts` to npm and GitHub Packages.

## Prerequisites

1. Ensure you have an npm account and are logged in:

```bash
npm login
```

2. Make sure you have the following GitHub repository secrets configured:

- `NPM_TOKEN`: Your npm access token
- `GITHUB_TOKEN`: Automatically provided by GitHub

## Automated Deployment

We use GitHub Actions for automated deployments. The process is triggered when a new release is created on GitHub.

### Steps for Creating a New Release

1. Update version in package.json:

```bash
{
  "name": "odoo-xmlrpc-ts",
  "version": "X.Y.Z", // Update this
  ...
}
```

2. Create and push a new git tag:

```bash
git add .
git commit -m "chore: prepare vX.Y.Z release"
git tag vX.Y.Z
git push origin main --tags
```

3. Create a new release on GitHub:

- Navigate to the repository on GitHub
- Go to "Releases"
- Click "Create a new release"
- Select the tag you just created
- Add release notes
- Publish the release

The GitHub Actions workflow will automatically:

- Run tests
- Build the package
- Publish to npm registry

## Manual Deployment

If you need to deploy manually:

1. Build the package:

```bash
pnpm run build
```

2. Test the build locally:

```bash
pnpm pack
```

3. Publish to npm:

```bash
pnpm publish --access public
```

## Version Guidelines

We follow semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes (backwards compatible)

## Verification

After deployment, verify the package is available:

```bash
npm info odoo-xmlrpc-ts
```

Users can then install the package using:

```bash
npm install odoo-xmlrpc-ts
# or
pnpm add odoo-xmlrpc-ts
```

## Troubleshooting

If deployment fails:

1. Check GitHub Actions logs for errors
2. Verify all required secrets are properly set
3. Ensure your npm token has not expired
4. Verify the version number is not already published
5. Check if the package name is available on npm

## Post-Deployment

After successful deployment:

1. Verify the package works by installing it in a test project
2. Update documentation if needed
3. Notify users of new release through appropriate channels
4. Monitor for any reported issues

## Notes

- Always test thoroughly before deploying
- Keep release notes clear and comprehensive
- Follow semantic versioning strictly
- Update changelog with each release
