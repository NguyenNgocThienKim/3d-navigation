// dist/libs/jsm/utils/BufferGeometryUtils.js
export function mergeBufferGeometries(geometries, useGroups = false) {
    const isIndexed = geometries[0].index !== null;

    const attributesUsed = new Set(Object.keys(geometries[0].attributes));
    const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
    const attributes = {};
    const morphAttributes = {};
    const mergedGeometry = new THREE.BufferGeometry();

    // Collect attributes
    for (const name of attributesUsed) {
        attributes[name] = [];
    }

    for (const name of morphAttributesUsed) {
        morphAttributes[name] = [];
    }

    let offset = 0;
    for (let i = 0; i < geometries.length; ++i) {
        const geometry = geometries[i];

        // Groups
        if (useGroups) {
            let count;
            if (isIndexed) {
                count = geometry.index.count;
            } else if (geometry.attributes.position !== undefined) {
                count = geometry.attributes.position.count;
            } else {
                console.warn('BufferGeometryUtils: could not compute vertex count.');
                return null;
            }

            mergedGeometry.addGroup(offset, count, i);
            offset += count;
        }

        // Attributes
        for (const name in geometry.attributes) {
            attributes[name].push(geometry.attributes[name]);
        }

        // Morph attributes
        for (const name in geometry.morphAttributes) {
            morphAttributes[name].push(...geometry.morphAttributes[name]);
        }
    }

    // Merge attributes
    for (const name in attributes) {
        mergedGeometry.setAttribute(name, THREE.BufferAttributeUtils.mergeBufferAttributes(attributes[name]));
    }

    // Merge morph attributes
    for (const name in morphAttributes) {
        mergedGeometry.morphAttributes[name] = morphAttributes[name];
    }

    return mergedGeometry;
}
export function toTrianglesDrawMode(geometry, drawMode) {
	const index = geometry.getIndex();

	// generate index if not present
	if (index === null) {
		const indices = [];

		const position = geometry.getAttribute('position');

		if (position !== undefined) {
			for (let i = 0; i < position.count; i++) {
				indices.push(i);
			}

			geometry.setIndex(indices);
		} else {
			console.error('BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute.');
			return geometry;
		}
	}

	const numberOfTriangles = (index.count / 3) * 2;
	const newIndices = [];

	for (let i = 0; i < index.count; i += 3) {
		const a = index.getX(i + 0);
		const b = index.getX(i + 1);
		const c = index.getX(i + 2);

		newIndices.push(a, b, c);

		if (drawMode === THREE.TriangleStripDrawMode) {
			newIndices.push(b, c, a);
		} else {
			newIndices.push(a, c, b);
		}
	}

	if (newIndices.length !== numberOfTriangles * 3) {
		console.error('BufferGeometryUtils.toTrianglesDrawMode(): Invalid number of triangles.');
	}

	const newGeometry = geometry.clone();
	newGeometry.setIndex(newIndices);
	return newGeometry;
}
