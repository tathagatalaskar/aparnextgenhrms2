package gov.nic.apar.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.DisabledException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    @Test
    void disabledAccountsReceiveAForbiddenResponseInsteadOfInternalServerError() {
        var response = new GlobalExceptionHandler().disabled(new DisabledException("disabled"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals(
                "Account is inactive or awaiting authority approval. Contact your reporting authority.",
                response.getBody().get("error"));
    }
}
