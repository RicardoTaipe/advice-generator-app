import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { API_URL } from "../constants";
import AdviceGenerator from "@/components/AdviceGenerator";

describe("Advicegenerator", () => {
  const mockData = {
    slip: {
      id: 99,
      advice: "Lorem ipsum quote",
    },
  };

  const server = setupServer(
    http.get(API_URL, () => {
      return HttpResponse.json(mockData, { status: 200 });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("should load a quote from API", async () => {
    const user = userEvent.setup();
    render(<AdviceGenerator />);
    const buttonElement = screen.getByTitle(/get a new quote/i);
    await user.click(buttonElement);
    const quoteElement = await screen.findByRole("quote");
    const headingElement = await screen.findByRole("heading");
    expect(quoteElement).toHaveTextContent(mockData.slip.advice);
    expect(headingElement).toHaveTextContent(`Advice # ${mockData.slip.id}`);
  });

  test("should handle server error", async () => {

    server.use(
      http.get(API_URL, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const user = userEvent.setup();
    render(<AdviceGenerator />);
    const buttonElement = screen.getByTitle(/get a new quote/i);

    await user.click(buttonElement);
    const quoteElement = await screen.findByRole("quote");
    const headingElement = await screen.findByRole("heading");
    expect(quoteElement).toHaveTextContent("Something went wrong...");
    expect(headingElement).toHaveTextContent("Advice #");
  });
});