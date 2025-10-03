# Keycloak Integration Setup

This frontend application is now protected with Keycloak authentication.

## Configuration

The Keycloak configuration is located in `frontend/src/auth/KeycloakProvider.tsx` and can be customized using environment variables:

- `VITE_KEYCLOAK_URL`: Keycloak server URL (default: http://localhost:8080/)
- `VITE_KEYCLOAK_REALM`: Keycloak realm name (default: myrealm)
- `VITE_KEYCLOAK_CLIENT_ID`: Keycloak client ID (default: frontend-app)

## Keycloak Setup Requirements

1. **Keycloak Server**: Running on http://localhost:8080/
2. **Realm**: `myrealm` (or configure via environment variable)
3. **Client**: `frontend-app` with the following settings:
   - Client Protocol: `openid-connect`
   - Access Type: `public`
   - Standard Flow Enabled: `ON`
   - Direct Access Grants Enabled: `OFF`
   - Valid Redirect URIs: `http://localhost:5173/*` (or your frontend URL)
   - Web Origins: `http://localhost:5173` (or your frontend URL)

## How It Works

1. **Authentication Flow**: When the app loads, it automatically redirects to Keycloak for authentication
2. **Token Management**: Keycloak handles token refresh and validation
3. **User Interface**: 
   - Shows loading spinner during authentication
   - Displays user info and logout button when authenticated
   - Shows error messages if authentication fails

## Usage in Components

```tsx
import { useAuth } from "./auth/KeycloakProvider";

function MyComponent() {
  const { isAuthenticated, keycloak, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return (
    <div>
      <p>Welcome {keycloak.tokenParsed?.preferred_username}</p>
      <button onClick={() => keycloak.logout()}>Logout</button>
    </div>
  );
}
```

## Development

To run the frontend with Keycloak:

1. Ensure Keycloak is running on Docker
2. Configure the realm and client as described above
3. Start the frontend: `npm run dev`
4. The app will automatically redirect to Keycloak for authentication

## Troubleshooting

- **CORS Issues**: Make sure the frontend URL is added to Keycloak's Web Origins
- **Redirect Issues**: Verify the Valid Redirect URIs in Keycloak client settings
- **Token Issues**: Check that the client is configured as a public client with Standard Flow enabled
