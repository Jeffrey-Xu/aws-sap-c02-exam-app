// Test registration page as API endpoint to bypass Vercel routing
export default async function handler(req, res) {
  // Set proper headers for HTML content
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Registration Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
        button:hover { background: #005a87; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .result { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .loading { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <h1>🧪 Simple Registration Test</h1>
    <p><strong>Purpose:</strong> Test server-side registration without complex frontend stores.</p>
    <p><strong>API Endpoint:</strong> /api/simple-register</p>
    
    <form id="registrationForm">
        <div class="form-group">
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" required placeholder="Enter first name">
        </div>
        
        <div class="form-group">
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" required placeholder="Enter last name">
        </div>
        
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required placeholder="Enter email address">
        </div>
        
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required placeholder="Enter password">
        </div>
        
        <button type="submit" id="submitBtn">Register User</button>
    </form>
    
    <div id="result"></div>

    <script>
        document.getElementById('registrationForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const resultDiv = document.getElementById('result');
            const submitBtn = document.getElementById('submitBtn');
            
            // Show loading state
            resultDiv.className = 'result loading';
            resultDiv.innerHTML = '⏳ Registering user...';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';
            
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            try {
                console.log('Sending registration request:', formData);
                
                const response = await fetch('/api/simple-register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                const data = await response.json();
                console.log('Response data:', data);
                
                if (response.ok) {
                    resultDiv.className = 'result success';
                    resultDiv.innerHTML = \`
                        <h3>✅ Success!</h3>
                        <p><strong>User created:</strong> \${data.user.firstName} \${data.user.lastName}</p>
                        <p><strong>Email:</strong> \${data.user.email}</p>
                        <p><strong>ID:</strong> \${data.user.id}</p>
                        <p><strong>Created:</strong> \${new Date(data.user.createdAt).toLocaleString()}</p>
                        <p><strong>Message:</strong> \${data.message}</p>
                    \`;
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = \`
                        <h3>❌ Registration Failed</h3>
                        <p><strong>Error:</strong> \${data.error}</p>
                        <p><strong>Code:</strong> \${data.code}</p>
                        \${data.details ? \`<p><strong>Details:</strong> \${data.details}</p>\` : ''}
                    \`;
                }
            } catch (error) {
                console.error('Network error:', error);
                resultDiv.className = 'result error';
                resultDiv.innerHTML = \`
                    <h3>🚨 Network Error</h3>
                    <p><strong>Error:</strong> \${error.message}</p>
                    <p><strong>Type:</strong> Network/Connection issue</p>
                    <p>Check browser console for more details.</p>
                \`;
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register User';
            }
        });
        
        // Add some helpful info
        console.log('Simple Registration Test Page Loaded');
        console.log('Testing endpoint: /api/simple-register');
        console.log('Environment variables should be configured for KV_REST_API_URL and KV_REST_API_TOKEN');
    </script>
</body>
</html>
  `;

  res.status(200).send(html);
}
