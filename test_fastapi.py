
import requests

# Mocking the request that axios would make
# If axios sends ?origins[]=Vietnam, let's see what happens.
url = "http://localhost:8000/api/dashboard/test-id"
params = {"origins[]": ["Vietnam"]}

# I can't actually run this against the server without starting it.
# But I can check FastAPI behavior in a script.

from fastapi import FastAPI, Query
from typing import List, Optional
import uvicorn
from multiprocessing import Process
import time

app = FastAPI()

@app.get("/test")
async def test(origins: Optional[List[str]] = Query(None)):
    return {"origins": origins}

@app.get("/test_alias")
async def test_alias(origins: Optional[List[str]] = Query(None, alias="origins[]")):
    return {"origins": origins}

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8888)

if __name__ == "__main__":
    p = Process(target=run_server)
    p.start()
    time.sleep(2)
    
    # Test 1: standard param
    r1 = requests.get("http://127.0.0.1:8888/test", params={"origins": ["Vietnam"]})
    print(f"Test 1 (origins=Vietnam): {r1.json()}")
    
    # Test 2: bracketed param
    r2 = requests.get("http://127.0.0.1:8888/test", params={"origins[]": ["Vietnam"]})
    print(f"Test 2 (origins[]=Vietnam): {r2.json()}")
    
    # Test 3: bracketed param with alias
    r3 = requests.get("http://127.0.0.1:8888/test_alias", params={"origins[]": ["Vietnam"]})
    print(f"Test 3 (origins[]=Vietnam with alias): {r3.json()}")
    
    p.terminate()
