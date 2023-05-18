import {
  EqualityFn,
  shallowEqual,
  TypedUseSelectorHook,
  useSelector,
} from 'react-redux';
import { RootState } from 'renderer/store';

type Selector<T> = (state: RootState) => T;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useShallowEqualSelector = <TSelected>(
  selector: Selector<TSelected>,
  equalityFn?: EqualityFn<TSelected>
) => {
  return useAppSelector(selector, equalityFn ?? shallowEqual);
};
