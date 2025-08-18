package fer.jbockal.mrp_backend.controller;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;

@Component
public class IncomingRequestLoggerFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(IncomingRequestLoggerFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        log.info(">>> Incoming {} {}", request.getMethod(), request.getRequestURI());
        log.info("Content-Type header: {}", request.getHeader("Content-Type"));
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            log.info("{}: {}", name, request.getHeader(name));
        }
        filterChain.doFilter(request, response);
    }
}
