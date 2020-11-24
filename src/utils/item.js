export const ingredientSuffixes = ["Aegis", "Barrel", "Barrels", "Blade", "Blades", "Boot", "Carapace", "Chain", "Chassis", "Core", "Cerebrum", "Day Aspect", "Disc", "Gauntlet", "Grip", "Guard", "Handle", "Harness", "Head", "Limbs", "Link", "Lower Limb", "Motor", "Neuroptics", "Night Aspect", "Ornament", "Pouch", "Receiver", "Receivers", "Rivet", "Stars", "Stock", "String", "Subcortex", "Systems", "Upper Limb", "Wings"];

export const foundersItems = ["Excalibur Prime", "Skana Prime", "Lato Prime"];

export function getItemComponents(item, itemName) {
    let totalIngredients = {};
    if (item.components) item.components.forEach(component => {
        let count = component.split("x")[0];
        let componentName = component.slice(count.length + 2);
        count = parseInt(count);
        if (ingredientSuffixes.includes(componentName)) componentName = itemName + " " + componentName;
        if (!totalIngredients[componentName]) totalIngredients[componentName] = 0;
        totalIngredients[componentName] += count;
    });
    return totalIngredients;
}

export function complexToSimpleList(complex) {
    let simple = [];
    Object.keys(complex).forEach(category => {
        let categoryItems = complex[category];
        Object.keys(categoryItems).forEach(itemName => {
            let item = categoryItems[itemName];
            item.name = itemName;
            item.type = category;
            simple.push(item);
        });
    });
    return simple;
}