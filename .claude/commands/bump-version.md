# Bump Version Command

Автоматизирует процесс увеличения версии приложения с обновлением документации и git операциями.

## Usage

```bash
/bump-version [patch|minor|major]
```

## Enhanced Process

1. **Version Detection**:
   - Проверяет текущую версию в package.json, composer.json, Cargo.toml или pyproject.toml
   - Поддерживает множественные package managers

2. **Smart Version Bump**:
   - `patch` (1.0.0 → 1.0.1): Багфиксы
   - `minor` (1.0.0 → 1.1.0): Новая функциональность
   - `major` (1.0.0 → 2.0.0): Breaking changes
   - Автоматическое определение типа изменений по git diff

3. **Documentation Updates**:
   - Обновляет CHANGELOG.md с форматированием Keep a Changelog
   - Добавляет секцию с новой версией и датой
   - Перемещает "Unreleased" изменения в новую версию

4. **Git Operations**:
   - Создает коммит с message: `chore: bump version to v{version}`
   - Создает git tag с версией
   - Опционально push в remote repository

5. **Validation**:
   - Проверяет, что рабочая директория чистая
   - Валидирует формат версии (semver)
   - Проверяет наличие конфликтов

## Example Output

```
Current version: 1.2.3
Bumping to: 1.3.0 (minor)
✓ Updated package.json
✓ Updated CHANGELOG.md
✓ Created commit: chore: bump version to v1.3.0
✓ Created tag: v1.3.0
? Push to remote? (y/N)
```