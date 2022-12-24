# Changelog

All notable changes to this project will be documented in this file.

## v1.6.0 - 2022-12-24

### Added
- Added support to join directly with table, previously supported only subquery

## v1.5.0 - 2022-12-22

### Added
- Added support for `DELETE` queries + unit tests
- Added example to documentation for `DELETE` queries
- Added support for `UPDATE` queries + unit tests
- Added example to documentation for `UPDATE` queries

## v1.4.0 - 2022-12-18

### Added
- Added support for `INSERT INTO` queries + unit tests.
- Added examples to documentation for `INSERT INTO` queries.
- Added table of contents to documentation for easier navigation.

### Fixed
- Fixed bug where it wasn't possible to have WITH inside WITH statement

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
