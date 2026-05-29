package com.dreamspace.api.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public class PageResponseDTO<T> {
    private List<T> content;
    private PageableInfo pageable;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private boolean first;
    private int numberOfElements;
    private boolean empty;

    public PageResponseDTO(Page<T> page) {
        this.content = page.getContent();
        this.pageable = new PageableInfo(page.getNumber(), page.getSize());
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.last = page.isLast();
        this.first = page.isFirst();
        this.numberOfElements = page.getNumberOfElements();
        this.empty = page.isEmpty();
    }
    public static class PageableInfo {
        private int pageNumber;
        private int pageSize;

        public PageableInfo(int pageNumber, int pageSize) {
            this.pageNumber = pageNumber;
            this.pageSize = pageSize;
        }

        public int getPageNumber() { return pageNumber; }
        public int getPageSize() { return pageSize; }
    }

    public List<T> getContent() {
        return content;
    }

    public PageableInfo getPageable() {
        return pageable;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public boolean isLast() {
        return last;
    }

    public boolean isFirst() {
        return first;
    }

    public int getNumberOfElements() {
        return numberOfElements;
    }

    public boolean isEmpty() {
        return empty;
    }
}
