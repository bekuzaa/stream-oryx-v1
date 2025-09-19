//
// Copyright (c) 2022-2024 Winlin
//
// SPDX-License-Identifier: MIT
//
import React from "react";
import Container from "react-bootstrap/Container";
import {Form, Button, Spinner} from 'react-bootstrap';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {Token, Tools} from '../utils';
import {SrsErrorBoundary} from "../components/SrsErrorBoundary";
import {useErrorHandler} from "react-error-boundary";
import {useTranslation} from "react-i18next";

export default function Login({onLogin}) {
  return (
    <SrsErrorBoundary>
      <LoginImpl onLogin={onLogin} />
    </SrsErrorBoundary>
  );
}

function LoginImpl({onLogin}) {
  const [plaintext, setPlaintext] = React.useState(true);
  const [password, setPassword] = React.useState();
  const [operating, setOperating] = React.useState(false);
  const navigate = useNavigate();
  const passwordRef = React.useRef();
  const plaintextRef = React.useRef();
  const handleError = useErrorHandler();
  const {t} = useTranslation();

  // Verify the token if exists.
  React.useEffect(() => {
    const token = Token.load();
    if (!token || !token.token) return;

    console.log(`Login: Verify, token is ${Tools.mask(token)}`);

    // Both JWT token or Bearer token are OK. Here we use JWT token.
    axios.post('/terraform/v1/mgmt/token', {
      ...token,
    }).then(res => {
      // Here we use the Bearer token to verify again.
      axios.post('/terraform/v1/mgmt/token', {
      }, {
        headers: Token.loadBearerHeader(),
      }).then(res => {
        console.log(`Login: Done, token is ${Tools.mask(token)}`);
        navigate('/routers-scenario');
      });
    }).catch(handleError);
  }, [navigate, handleError]);

  // Focus to password input.
  React.useEffect(() => {
    plaintext ? plaintextRef.current?.focus() : passwordRef.current?.focus();
  }, [plaintext]);

  // User click login button.
  // Note that we use callback, because when we use it in other hooks, it might be null, for example, to use handleLogin
  // in useEffect, which should depends on the hooks, but should never depends on RAW function, because it always
  // changes its value. See https://stackoverflow.com/a/55854902/17679565
  const handleLogin = React.useCallback((e) => {
    e.preventDefault();
    setOperating(true);

    axios.post('/terraform/v1/mgmt/login', {
      password,
    }).then(async (res) => {
      await new Promise(resolve => setTimeout(resolve, 600));

      const data = res.data.data;
      console.log(`Login: OK, token is ${Tools.mask(data)}`);
      Token.save(data);

      onLogin && onLogin();
      navigate('/routers-scenario');
    }).catch(handleError).finally(setOperating);
  }, [password, handleError, onLogin, navigate, setOperating]);

  return (
    <>
      <Container fluid className="fade-in">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card">
              <div className="card-header text-center">
                <h4 className="mb-0">{t('login.title') || 'Login to ORYX'}</h4>
              </div>
              <div className="card-body">
                <Form>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>{t('login.passwordLabel')}</Form.Label>
                    {
                      !plaintext &&
                      <Form.Control type="password" placeholder="Password" ref={passwordRef} defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}/>
                    }
                    {
                      plaintext &&
                      <Form.Control type="text" placeholder="Password" ref={plaintextRef} defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}/>
                    }
                    <Form.Text className="text-muted">
                      * {t('login.passwordTip')}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label={t('login.labelShow')} defaultChecked={plaintext}
                      onClick={() => setPlaintext(!plaintext)}/>
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit" disabled={operating} onClick={(e) => handleLogin(e)}>
                      {t('login.labelLogin')}
                    </Button>
                  </div>
                  {operating && (
                    <div className="text-center mt-3">
                      <Spinner animation="border" variant="primary" style={{verticalAlign: 'middle'}} />
                    </div>
                  )}
                </Form>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

