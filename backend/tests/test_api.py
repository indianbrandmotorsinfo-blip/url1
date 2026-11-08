from fastapi.testclient import TestClient

VALID = {"name": "GitHub", "url": "https://github.com", "description": "Source code"}


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_rejects_wrong_password(client: TestClient) -> None:
    response = client.post("/api/auth/login", json={"username": "admin", "password": "nope"})
    assert response.status_code == 401


def test_login_rejects_unknown_user(client: TestClient) -> None:
    response = client.post("/api/auth/login", json={"username": "ghost", "password": "nope"})
    assert response.status_code == 401


def test_me_requires_token(client: TestClient, auth_headers: dict[str, str]) -> None:
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer junk"}).status_code == 401
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.json() == {"username": "admin"}


def test_listing_is_public(client: TestClient) -> None:
    assert client.get("/api/urls").status_code == 200


def test_changes_require_admin(client: TestClient) -> None:
    assert client.post("/api/urls", json=VALID).status_code == 401
    assert client.put("/api/urls/1", json=VALID).status_code == 401
    assert client.delete("/api/urls/1").status_code == 401


def test_crud_flow(client: TestClient, auth_headers: dict[str, str]) -> None:
    created = client.post("/api/urls", json=VALID, headers=auth_headers)
    assert created.status_code == 201
    url_id = created.json()["id"]

    assert any(item["id"] == url_id for item in client.get("/api/urls").json())

    updated = client.put(
        f"/api/urls/{url_id}",
        json={**VALID, "name": "GitHub Actions"},
        headers=auth_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "GitHub Actions"

    assert client.delete(f"/api/urls/{url_id}", headers=auth_headers).status_code == 204
    assert client.delete(f"/api/urls/{url_id}", headers=auth_headers).status_code == 404


def test_rejects_non_http_urls(client: TestClient, auth_headers: dict[str, str]) -> None:
    bad_urls = [
        "javascript:alert(1)",
        "ftp://example.com",
        "github.com",
        "https://",
        "data:text/html,x",
    ]
    for bad in bad_urls:
        response = client.post("/api/urls", json={**VALID, "url": bad}, headers=auth_headers)
        assert response.status_code == 422, bad
        assert "url" in response.json()["detail"]


def test_rejects_empty_and_oversized_fields(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    empty = client.post("/api/urls", json={**VALID, "name": "   "}, headers=auth_headers)
    assert empty.status_code == 422
    long = client.post("/api/urls", json={**VALID, "description": "x" * 161}, headers=auth_headers)
    assert long.status_code == 422
