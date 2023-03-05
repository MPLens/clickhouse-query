# Changelog

All notable changes to this project will be documented in this file.

## v1.7.4 - 2023-02-08

### Added 
- Added `argMin` and `argMax` aggregate functions
- Fixed multiple nested `WITH` behavior
- Method `.as(...)` now supports second argument `position` to specify position of alias 
in `SELECT` statement (`last` as default)

## v1.7.3 - 2023-01-26

### Fixed
- Fixed invalid alias usage for WITH in case of subquery

## v1.7.2 - 2023-01-01

### Fixed
- Fixed bug when alias wasn't included in `FROM statement with subquery in it 

## v1.7.1 - 2022-12-26

- Added support for `FINAL` modifier in `SELECT` queries, mainly used for ReplacingMergeTree engine 
- Fixed alias usage for tables in `SELECT` queries
- Fixed unit tests for `CREATE TABLE` queries

## v1.7.0 - 2022-12-25

- Added support for `CREATE TABLE` + unit tests
- Added example to documentation for `CREATE TABLE` queries

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
