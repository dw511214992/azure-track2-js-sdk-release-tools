## 30.0.0

This is beta preview version.

This version uses a next-generation code generator that introduces important breaking changes, but also important new features (like unified authentication and async programming).

**General breaking changes**

- Authentication system has been completely revamped:

  - Package `@azure/ms-rest-nodeauth` or `@azure/ms-rest-browserauth` are no longer supported, use package `@azure/identity` instead: https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/identity/identity

- Operations with prefix `begin` like `beginXXX` that used to return a `Promise<Models.XXX>` now returns a `LROPoller`, and if you want to get previous result, please use operation name with prefix `begin` and suffix `AndWait`, such as `beginXXXAndWait`.
- Operation `list` used to return `Promise<Models.XXX>` now returns a iterable result: `PagedAsyncIterableIterator`.
