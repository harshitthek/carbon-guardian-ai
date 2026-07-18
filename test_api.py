import requests

s = requests.Session()
r_login = s.post('http://127.0.0.1:8000/auth/login', json={'email': 'aarav@carbonguardian.ai', 'password': 'devpassword123'})
print('Login:', r_login.status_code, r_login.text)

cookies = r_login.cookies.get_dict()
r_rec = s.post('http://127.0.0.1:8000/ai/recommend', json={'time_of_day': 14, 'location_aqi': 110, 'weather_temp': 35.5}, cookies=cookies)
print('Rec:', r_rec.status_code, r_rec.text)
