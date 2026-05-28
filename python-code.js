const pythonCode = `
import numpy as np
import json
from scipy.linalg import expm

def _dict_to_complex(obj):
    if isinstance(obj, list): return [_dict_to_complex(item) for item in obj]
    return complex(obj['real'], obj['imag']) if isinstance(obj, dict) else obj

import numpy as np

def _complex_to_dict(obj):
    if isinstance(obj, list):
        return [_complex_to_dict(item) for item in obj]

    if isinstance(obj, np.ndarray):
        return [_complex_to_dict(item) for item in obj.tolist()]

    if isinstance(obj, complex):
        return {"re": obj.real, "im": obj.imag}

    if isinstance(obj, (np.floating, np.integer)):
        return {"re": float(obj), "im": 0.0}

    if isinstance(obj, (float, int)):
        return {"re": obj, "im": 0.0}

    raise TypeError(f"Unsupported type: {type(obj)}")

Z = np.array([[1,0],[0,-1]], dtype=complex)
I2 = np.eye(2, dtype=complex)

def get_state_0(theta0):
    state0 = np.kron(
        np.array([1,0], dtype=complex), Ry(theta0) @ np.array([1,0], 
    dtype=complex))
    return json.dumps(_complex_to_dict(state0))

def Rx(theta):
    return np.array([
        [np.cos(theta/2), -1j*np.sin(theta/2)],
        [-1j*np.sin(theta/2), np.cos(theta/2)]
    ], dtype=complex)

def Ry(theta):
    return np.array([
        [np.cos(theta/2), -np.sin(theta/2)],
        [np.sin(theta/2),  np.cos(theta/2)]
    ], dtype=complex)

def Rz(theta):
    return np.array([
        [np.exp(-1j*theta/2), 0],
        [0, np.exp(1j*theta/2)]
    ], dtype=complex)

def R(axis, theta):
    if axis == 'x':
        return Rx(theta)
    elif axis == 'y':
        return Ry(theta)
    else:
        return Rz(theta)

def apply_op(state, op):
    new_state = op @ state
    return new_state / np.linalg.norm(new_state)

def apply_rotation(input_json):
    input = json.loads(input_json)
    qubit_index = input['qubitIndex']
    axis = input['axis']
    rot = input['rot']

def partial_trace(state, keep=0):
    rho = np.outer(state, np.conj(state))
    if keep == 0:
        return np.array([[rho[0,0]+rho[1,1], rho[0,2]+rho[1,3]],
                         [rho[2,0]+rho[3,1], rho[2,2]+rho[3,3]]])
    else:
        return np.array([[rho[0,0]+rho[2,2], rho[0,1]+rho[2,3]],
                         [rho[1,0]+rho[3,2], rho[1,1]+rho[3,3]]])

def bloch_vector(rho):
    x = np.real(np.trace(rho @ np.array([[0,1],[1,0]])))
    y = np.real(np.trace(rho @ np.array([[0,-1j],[1j,0]])))
    z = np.real(np.trace(rho @ np.array([[1,0],[0,-1]])))
    return [x,y,z]

{
    "getState0": get_state_0
}
`;