import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import { MemoryRouter } from "react-router-dom";
import { Data } from "./types";
import { test, expect } from 'vitest';
import '@testing-library/jest-dom';

const data: Data = {
  regions: [],
  plantTypes: [],
  waterUseClassifications: [],
  plants: [],
  photos: {},
  cities: [],
  benchCardTemplates: [],
  plantTypeNameByCode: {},
  waterUseByCode: {},
  cityOptions: [],
};

test('renders "Welcome to WUCOLS"', () => {
  const { getByText } = render(
      <MemoryRouter>
        <App data={data} />
      </MemoryRouter>
  );
  const linkElement = getByText(/Welcome to WUCOLS/i);
  expect(linkElement).toBeInTheDocument();
});
