export type Maybe<T> = T | null;
export type MaybeUndef<T> = T | undefined;
export type NullableUndef<T> = T | undefined | null;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type AdditionalActionOnSuccessType<T = any> = {
  additionalActionOnSuccess?: (params?: T) => Promise<void> | void;
};

type AdditionalActionOnErrorType<T = any> = {
  additionalActionOnError?: (params?: T) => Promise<void> | void;
};

type AdditionalActionOnDecryptErrorType<T = any> = {
  additionalActionOnDecryptError?: (params?: T) => Promise<void> | void;
};

export type AddActionOnSuccessType<InputType, T = any> = InputType &
  AdditionalActionOnSuccessType<T>;

export type AddActionOnErrorType<InputType, ET = any> = InputType &
  AdditionalActionOnErrorType<ET>;

export type AddActionOnSuccessAndErrorType<
  InputType,
  ST = any,
  ET = any
> = InputType &
  AdditionalActionOnSuccessType<ST> &
  AdditionalActionOnErrorType<ET>;

export type AddActionOnDecryptErrorType<InputType, T = any> = InputType &
  AdditionalActionOnDecryptErrorType<T>;

export type AddActionOnSuccessAndDecryptType<
  InputType,
  ST = any,
  ET = any
> = InputType &
  AdditionalActionOnSuccessType<ST> &
  AdditionalActionOnDecryptErrorType<ET>;
