import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

type ExtractedResponse<T> = { items: T[]; total: number };

type PaginationProps<T, U, V> = {
  fetchUrl: string;
  requestFactory: (offset: number, limit: number) => U;
  responseExtractor: (data: V) => ExtractedResponse<T>;
};

const PER_PAGE = 10;
const usePagination = <T, U, V>({
  fetchUrl,
  requestFactory,
  responseExtractor,
}: PaginationProps<T, U, V>) => {
  const [items, setItems] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fetchData = (
    request: U,
    callback: (res: AxiosResponse<V, any>) => void
  ) =>
    axios
      .post<V>(fetchUrl, request, { withCredentials: true })
      .then(callback)
      .catch((err) => {
        console.error(`Error: ${err}`);
      });

  useEffect(() => {
    const request = requestFactory(offset, PER_PAGE);
    fetchData(request, (res) => {
      const updatedItems = responseExtractor(res.data);
      setItems(updatedItems.items);
      setTotal(updatedItems.total);
      setTotalPages(Math.ceil(updatedItems.total / PER_PAGE) + 1);
      setHasNext(offset + PER_PAGE < updatedItems.total);
    });
  }, []);

  const nextPage = () => {
    const newOffset = offset + PER_PAGE;
    const request: U = requestFactory(newOffset, PER_PAGE);
    fetchData(request, (res) => {
      const updatedItems = responseExtractor(res.data);
      setItems(updatedItems.items);
      setOffset(newOffset);
      setHasNext(newOffset + PER_PAGE < total);
      setHasPrevious(true);
      if (updatedItems.total !== total) {
        setTotal(updatedItems.total);
      }
    });
  };

  const previousPage = () => {
    const newOffset = Math.max(0, offset - PER_PAGE);
    const request: U = requestFactory(newOffset, PER_PAGE);
    fetchData(request, (res) => {
      const updatedItems = responseExtractor(res.data);
      setItems(updatedItems.items);
      setOffset(newOffset);
      setHasNext(true);
      setHasPrevious(newOffset > 0);
      if (updatedItems.total !== total) {
        setTotal(updatedItems.total);
      }
    });
  };

  return {
    page: Math.ceil(offset / PER_PAGE) + 1,
    items,
    totalPages,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    total,
  };
};

export default usePagination;
