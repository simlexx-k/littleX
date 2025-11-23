#!/usr/bin/env python3
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def login():
    print("🔑 Logging in...")
    response = requests.post(
        f"{BASE_URL}/walker/login_user",
        json={"email": "a3slabs@gmail.com", "password": "runnermax"}
    )
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return None
    
    data = response.json()
    reports = data.get("reports", [])
    if not reports or not reports[0]:
        print("❌ No token in response")
        return None
        
    token = reports[0][0].get("token")
    print(f"✅ Logged in. Token: {token[:10]}...")
    return token

def create_tweet(token):
    print("📝 Creating tweet...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/walker/create_tweet",
        json={"content": "Hello World! This is a test tweet #test", "ai_assisted": True},
        headers=headers
    )
    if response.status_code != 200:
        print(f"❌ Create tweet failed: {response.text}")
        return None
    
    print("✅ Tweet created")
    return True

def load_feed(token):
    print("📰 Loading feed...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/walker/load_feed",
        json={},
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Load feed failed: {response.text}")
        return
        
    data = response.json()
    reports = data.get("reports", [])
    if not reports:
        print("❌ No reports in feed response")
        return
        
    feed = reports[0]
    print(f"✅ Feed loaded. Found {len(feed)} tweets.")
    for item in feed:
        tweet = item.get("Tweet_Info", {}).get("context", {})
        print(f"  - {tweet.get('content')} (AI: {tweet.get('ai_assisted')})")

def main():
    token = login()
    if token:
        create_tweet(token)
        time.sleep(1)
        load_feed(token)

if __name__ == "__main__":
    main()
