export type Result<T, E = undefined> =
  | {
      status: "pending" | "initial";
      value?: undefined;
      error?: undefined;
    }
  | {
      status: "success";
      value: T;
      error?: undefined;
    }
  | {
      status: "error";
      value?: undefined;
      error?: E;
    };
