```markdown
# AGENTS.md - AI Coding Agent Guidelines

These guidelines detail the approach to developing AI coding agents for the AGENTS repository. Adherence to these principles is crucial for maintaining code quality, maintainability, and stability.

## 1. DRY (Don't Repeat Yourself)

- Avoid duplication of logic, data structures, and algorithms.
- When a functionality is reused, it should be encapsulated in a separate, well-documented module or function.
- Leverage existing code and libraries wherever possible.
- Implement clear and concise abstractions to ensure consistency.

## 2. KISS (Keep It Simple, Stupid)

- Strive for minimal complexity in each component.
- Avoid unnecessary abstractions or over-engineering.
- Prioritize readability and maintainability.
- Use straightforward, understandable code.
- Focus on the core requirements; complex features can be addressed later.

## 3. SOLID Principles

- **Single Responsibility Principle:** Each class/module should have a single, well-defined responsibility.
- **Open/Closed Principle:** The system should be extensible without modification. New functionality should be added via new classes without altering existing code.
- **Liskov Substitution Principle:**  Subclasses should be able to replace their base classes without affecting the correctness of the program.
- **Interface Segregation Principle:** Client code should not be forced to depend on methods they do not use.
- **Component-Based Design:** Design the system around independent, reusable components.

## 4. YAGNI (You Aren't Gonna Need It)

- Only implement features that are currently required.
- Avoid adding functionality prematurely based on assumptions.
- Refactor code to remove any unneeded elements.
- Clearly define the boundaries of each component.

## 5. Code Style & Formatting

- Consistent indentation and spacing (use 2 spaces).
- Use descriptive variable and function names.
- Implement a consistent code style (e.g., using a linter and formatter).
- Employ comments to explain complex logic.

## 6. File Size Limits

- Each file must be no more than 180 lines of code.
- Code should be structured to minimize line length.
- Utilize appropriate formatting tools to ensure readability.

## 7. Test Coverage Requirements

- Achieve a minimum of 80% test coverage across all files.
- Prioritize unit tests for individual functions and modules.
- Implement integration tests to verify interactions between components.
- Use a comprehensive test suite to ensure code quality.

## 8. Data Structures & Algorithms

- Employ appropriate data structures for the task.
- Consider performance implications when selecting algorithms.
- Maintain consistent data structures and algorithms throughout the codebase.

## 9. Dependency Management

- All dependencies should be clearly documented and managed.
- Utilize a dependency management system (e.g., a package manager) for external libraries.
- Ensure dependencies are stable and well-maintained.

## 10. Error Handling

- Implement robust error handling with informative error messages.
- Use appropriate exception types and handling mechanisms.
- Avoid bare `try...except` blocks; use specific exception types when possible.

## 11. Documentation

- All functions, classes, and modules should have clear and concise documentation.
- Use docstrings to explain purpose, parameters, and return values.
- Provide examples of usage.

## 12. Production-Ready Code

- Prioritize readability and maintainability during development.
- Employ code reviews to identify potential issues.
- Conduct regular code audits.

## 13.  Code Clarity & Readability

- Use whitespace effectively to improve readability.
-  Employ meaningful variable names.
- Structure code logically using appropriate indentation.

## 14.  Component Interaction Guidelines

- Define clear communication protocols between components.
- Use events or messages to facilitate interaction.
- Ensure components can be easily integrated and modified.

## 15.  Versioning & Lifecycle

- Each file should have a unique identifier (version).
- Implement a lifecycle for files, particularly when integrating with external repositories.

## 16.  Testing Strategy

- Focus testing on critical functions and modules.
- Employ techniques like boundary value analysis and equivalence partitioning.
- Automate test execution whenever possible.

## 17.  Maintainability and Collaboration

- Design for future maintenance.
- Encourage collaboration among developers.

These guidelines are intended to serve as a foundation for developing high-quality AI coding agents. Continuous monitoring and refinement are essential for maintaining the integrity of the codebase.
```