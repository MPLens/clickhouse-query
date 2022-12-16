# Changelog

All notable changes to this project will be documented in this file.

## v1.3.0 - 2022-12-16

### Changed
- `with()` now accepts `Query`, `string`, list of select parameters, subqueries
- `with()` now accepts `alias` as second argument
- Added new `with()` examples to README.md

### Fixed
- Fixed issue when `offset()` was required to be used with `limit()`, now `limit()` can be used by itself

## v1.2.0 - 2022-12-15

### Changed

- Documentation improvements
- `winston` logger is not required 
