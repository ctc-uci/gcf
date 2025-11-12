import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Simple utility function to test
function add(a, b) {
  return a + b;
}

// Simple React component to test
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

describe("Basic Tests", () => {
  describe("Unit Test", () => {
    it("should add two numbers correctly", () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });
  });

  describe("Component Test", () => {
    it("should render greeting with name", () => {
      render(<Greeting name="World" />);
      const heading = screen.getByText("Hello, World!");
      expect(heading).toBeDefined();
      expect(heading.tagName).toBe("H1");
    });

    it("should render greeting with different name", () => {
      render(<Greeting name="Vitest" />);
      const heading = screen.getByText("Hello, Vitest!");
      expect(heading).toBeDefined();
      expect(heading.tagName).toBe("H1");
    });
  });
});
