use std::ops::RangeInclusive;

use sha3::{Digest, Keccak256};

/// Note: May cause stack overflow if output len too large (> 16)
pub fn random(range: RangeInclusive<u8>, output: &mut [u8], seed: &[u8]) {
    let mut hasher: Keccak256 = Keccak256::new();
    hasher.update(seed);

    let rand_bytes = hasher.finalize();
    let rand_bytes = rand_bytes.as_slice();

    let mut cursor = 0;
    'outer: for rand_byte in rand_bytes {
        let value = rand_byte % (range.end() - range.start() + 1) + range.start();
        for i in 0..cursor {
            if output[i] == value {
                continue 'outer;
            }
        }

        output[cursor] = value;
        cursor += 1;
        if cursor == output.len() {
            break;
        }
    }

    if cursor < output.len() {
        random(range, output, rand_bytes);
        return;
    }

    output.sort_unstable();
}
